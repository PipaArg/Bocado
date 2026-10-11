package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.model.Cliente;
import com.bocado.GestorRestaurante.api.model.MetodoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.model.Plato;
import com.bocado.GestorRestaurante.api.model.Turno;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

/*
 * Envia por mail el comprobante de pago al cliente de la reserva.
 *
 * IMPORTANTE: el comprobante es de EJEMPLO. Tiene estructura de factura (emisor, numero, cliente,
 * items, IVA contenido) pero con datos ficticios y una leyenda de "no valido como factura".
 * No tiene CAE ni esta autorizado por ARCA/AFIP.
 *
 * Funciona con cualquier servidor SMTP. Se configura con variables de entorno (nunca en archivos):
 *   MAIL_HOST        -> ej: smtp.gmail.com (si no esta definida, no se envian mails)
 *   MAIL_PORT        -> 587 por defecto (STARTTLS)
 *   MAIL_USER        -> cuenta remitente (ej: tu-cuenta@gmail.com)
 *   MAIL_PASSWORD    -> contrasena de aplicacion de esa cuenta
 *   MAIL_FROM_NAME   -> nombre que ve el cliente como remitente (default: Bocado)
 *
 * Para probar sin mandar mails reales: MAIL_HOST=localhost, MAIL_PORT=1025 y sin MAIL_USER (Mailpit).
 */
@Slf4j
@Service
public class EmailService {

    private static final Locale AR = Locale.of("es", "AR");
    private static final DateTimeFormatter FECHA_CORTA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Datos del emisor: ficticios a proposito.
    private static final String EMISOR_NOMBRE = "BOCADO";
    private static final String EMISOR_DETALLE = "Restaurante (empresa ficticia)";
    private static final String EMISOR_DOMICILIO = "Av. Siempre Viva 123, CABA";
    private static final String EMISOR_CUIT = "00-00000000-0 (ficticio)";
    private static final String LEYENDA = "DOCUMENTO NO VÁLIDO COMO FACTURA. Comprobante de ejemplo generado por "
            + "un proyecto académico. No tiene CAE ni validez fiscal.";

    @Value("${bocado.mail.host:${MAIL_HOST:}}")
    private String host;

    @Value("${bocado.mail.port:${MAIL_PORT:587}}")
    private int port;

    @Value("${bocado.mail.user:${MAIL_USER:}}")
    private String usuario;

    @Value("${bocado.mail.password:${MAIL_PASSWORD:}}")
    private String clave;

    @Value("${bocado.mail.from-name:${MAIL_FROM_NAME:Bocado}}")
    private String nombreRemitente;

    /**
     * Arma el comprobante y lo envia en segundo plano.
     * El contenido se arma aca (mientras la transaccion sigue abierta, para poder leer los platos)
     * y el envio corre aparte: si el servidor de mail falla o tarda, no afecta al pago ni al webhook.
     */
    public void enviarRecibo(Turno turno, Pago pago) {
        if (host == null || host.isBlank()) {
            log.warn("MAIL_HOST no esta configurada: no se envia el comprobante de la reserva {}", turno.getId());
            return;
        }
        Cliente cliente = turno.getCliente();
        if (cliente == null || cliente.getEmail() == null || cliente.getEmail().isBlank()) {
            log.warn("La reserva {} no tiene email de cliente: no se envia el comprobante", turno.getId());
            return;
        }

        String destino = cliente.getEmail().trim();
        String asunto = "Comprobante de pago - Reserva #" + turno.getId() + " - Bocado";
        String texto = armarTexto(turno, pago, cliente);
        String html = armarHtml(turno, pago, cliente);

        Thread.startVirtualThread(() -> enviar(destino, asunto, texto, html));
    }

    private void enviar(String destino, String asunto, String texto, String html) {
        try {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(host);
            sender.setPort(port);

            Properties props = sender.getJavaMailProperties();
            props.put("mail.smtp.connectiontimeout", "10000");
            props.put("mail.smtp.timeout", "10000");
            props.put("mail.smtp.writetimeout", "10000");
            if (usuario != null && !usuario.isBlank()) {
                sender.setUsername(usuario);
                sender.setPassword(clave);
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
            }

            String remitente = (usuario != null && !usuario.isBlank()) ? usuario : "no-reply@bocado.local";

            MimeMessage mensaje = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente, nombreRemitente);
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(texto, html);

            sender.send(mensaje);
            log.info("Comprobante enviado a {}", destino);
        } catch (Exception e) {
            log.error("No se pudo enviar el comprobante a {}: {}", destino, e.getMessage());
        }
    }

    /* ───────── Contenido del comprobante ───────── */

    private String armarTexto(Turno turno, Pago pago, Cliente cliente) {
        StringBuilder sb = new StringBuilder();
        sb.append(EMISOR_NOMBRE).append(" - ").append(EMISOR_DETALLE).append("\n");
        sb.append(EMISOR_DOMICILIO).append(" - CUIT ").append(EMISOR_CUIT).append("\n\n");
        sb.append("COMPROBANTE DE PAGO Nro ").append(numero(pago)).append("\n");
        sb.append("Fecha de emision: ").append(fechaEmision(pago)).append("\n");
        sb.append("Reserva #").append(turno.getId()).append(" - ").append(fecha(turno)).append(" ")
                .append(hora(turno)).append(" hs - ").append(turno.getCantidadComensales()).append(" personas\n");
        sb.append("Cliente: ").append(cliente.getNombre()).append(" ").append(cliente.getApellido()).append("\n\n");

        for (Map.Entry<Plato, Long> linea : platosAgrupados(turno).entrySet()) {
            Plato plato = linea.getKey();
            sb.append(linea.getValue()).append(" x ").append(plato.getNombre()).append(" (")
                    .append(moneda(plato.getPrecio())).append(") = ")
                    .append(moneda(plato.getPrecio().multiply(BigDecimal.valueOf(linea.getValue())))).append("\n");
        }
        sb.append("\nTOTAL: ").append(moneda(pago.getMonto())).append("\n");
        sb.append("IVA contenido (21%): ").append(moneda(ivaContenido(pago.getMonto()))).append("\n");
        sb.append("Forma de pago: ").append(formaDePago(pago)).append("\n\n");
        sb.append(LEYENDA).append("\n");
        return sb.toString();
    }

    private String armarHtml(Turno turno, Pago pago, Cliente cliente) {
        StringBuilder filas = new StringBuilder();
        for (Map.Entry<Plato, Long> linea : platosAgrupados(turno).entrySet()) {
            Plato plato = linea.getKey();
            BigDecimal subtotal = plato.getPrecio().multiply(BigDecimal.valueOf(linea.getValue()));
            filas.append("<tr>")
                    .append("<td style=\"padding:6px 8px;border-bottom:1px solid #ddd;text-align:center\">")
                    .append(linea.getValue()).append("</td>")
                    .append("<td style=\"padding:6px 8px;border-bottom:1px solid #ddd\">")
                    .append(esc(plato.getNombre())).append("</td>")
                    .append("<td style=\"padding:6px 8px;border-bottom:1px solid #ddd;text-align:right\">")
                    .append(moneda(plato.getPrecio())).append("</td>")
                    .append("<td style=\"padding:6px 8px;border-bottom:1px solid #ddd;text-align:right\">")
                    .append(moneda(subtotal)).append("</td>")
                    .append("</tr>");
        }

        String celda = "padding:14px;vertical-align:top;font-size:13px;line-height:1.6";

        return "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;"
                + "border:1px solid #333;color:#222\">"
                + "<div style=\"text-align:center;background:#c2410c;color:#fff;padding:8px;font-weight:bold;"
                + "letter-spacing:.1em\">COMPROBANTE DE PAGO</div>"
                // Emisor | datos del comprobante
                + "<table style=\"width:100%;border-collapse:collapse\"><tr>"
                + "<td style=\"width:50%;border-right:1px solid #333;" + celda + "\">"
                + "<div style=\"font-size:24px;font-weight:bold\">" + EMISOR_NOMBRE + "</div>"
                + esc(EMISOR_DETALLE) + "<br>" + esc(EMISOR_DOMICILIO) + "<br>CUIT: " + esc(EMISOR_CUIT) + "</td>"
                + "<td style=\"" + celda + "\">"
                + "<strong>Comprobante N&ordm;:</strong> " + numero(pago) + "<br>"
                + "<strong>Fecha de emisi&oacute;n:</strong> " + fechaEmision(pago) + "<br>"
                + "<strong>Reserva:</strong> #" + turno.getId() + " &middot; " + esc(fecha(turno)) + " &middot; "
                + hora(turno) + " hs<br>"
                + "<strong>Forma de pago:</strong> " + esc(formaDePago(pago)) + "</td>"
                + "</tr></table>"
                // Cliente
                + "<div style=\"border-top:1px solid #333;border-bottom:1px solid #333;padding:10px 14px;"
                + "font-size:13px\"><strong>Cliente:</strong> " + esc(cliente.getNombre()) + " "
                + esc(cliente.getApellido()) + " &middot; " + esc(cliente.getEmail()) + "</div>"
                // Items
                + "<table style=\"width:100%;border-collapse:collapse;font-size:13px\">"
                + "<tr style=\"background:#eee\"><th style=\"padding:6px 8px\">Cant.</th>"
                + "<th style=\"padding:6px 8px;text-align:left\">Descripci&oacute;n</th>"
                + "<th style=\"padding:6px 8px;text-align:right\">Precio unit.</th>"
                + "<th style=\"padding:6px 8px;text-align:right\">Total</th></tr>"
                + filas + "</table>"
                // Totales
                + "<div style=\"padding:14px;text-align:right;border-top:1px solid #333\">"
                + "<div style=\"font-size:18px\"><strong>Importe total: " + moneda(pago.getMonto()) + "</strong></div>"
                + "<div style=\"font-size:12px;color:#666;margin-top:4px\">R&eacute;gimen de transparencia fiscal "
                + "&ndash; IVA contenido (21%): " + moneda(ivaContenido(pago.getMonto())) + "</div></div>"
                // Leyenda
                + "<div style=\"background:#fef3c7;color:#92400e;padding:10px 14px;font-size:12px;"
                + "text-align:center;font-weight:bold;border-top:1px solid #333\">" + esc(LEYENDA) + "</div>"
                + "</div>";
    }

    // Fecha en que se cobro (la real, aunque el mail salga despues por falta de conexion).
    private String fechaEmision(Pago pago) {
        LocalDate fecha = pago.getFechaPago() != null ? pago.getFechaPago().toLocalDate() : LocalDate.now();
        return fecha.format(FECHA_CORTA);
    }

    private String numero(Pago pago) {
        return String.format("0001-%08d", pago.getId());
    }

    private String formaDePago(Pago pago) {
        if (pago.getMetodo() == MetodoPago.EFECTIVO) {
            return "Efectivo";
        }
        if (pago.getMetodo() == MetodoPago.TARJETA) {
            return "Tarjeta (terminal del local)";
        }
        String base = "Mercado Pago";
        return pago.getMercadoPagoId() != null ? base + " (pago N° " + pago.getMercadoPagoId() + ")" : base;
    }

    // En una factura a consumidor final el IVA ya esta incluido en el total: IVA = total * 21 / 121.
    private BigDecimal ivaContenido(BigDecimal total) {
        return total.multiply(BigDecimal.valueOf(21)).divide(BigDecimal.valueOf(121), 2, RoundingMode.HALF_UP);
    }

    // Agrupa los platos repetidos: [pizza, pizza, hamburguesa] -> {pizza=2, hamburguesa=1}
    private Map<Plato, Long> platosAgrupados(Turno turno) {
        List<Plato> platos = turno.getPlatos();
        Map<Long, List<Plato>> porId = platos.stream()
                .collect(Collectors.groupingBy(Plato::getId, LinkedHashMap::new, Collectors.toList()));
        Map<Plato, Long> resultado = new LinkedHashMap<>();
        porId.values().forEach(grupo -> resultado.put(grupo.get(0), (long) grupo.size()));
        return resultado;
    }

    private String fecha(Turno turno) {
        return turno.getFecha().format(DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy", AR));
    }

    private String hora(Turno turno) {
        return turno.getHora().format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String moneda(BigDecimal monto) {
        return NumberFormat.getCurrencyInstance(AR).format(monto);
    }

    private String esc(String texto) {
        return HtmlUtils.htmlEscape(texto == null ? "" : texto);
    }
}
