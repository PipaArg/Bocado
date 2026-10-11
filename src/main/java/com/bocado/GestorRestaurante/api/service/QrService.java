package com.bocado.GestorRestaurante.api.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

/*
 * Convierte un texto (en nuestro caso la URL de pago de Mercado Pago)
 * en una imagen PNG de un codigo QR.
 */
@Service
public class QrService {

    private static final int TAMANIO = 400;

    public byte[] generarPng(String contenido) {
        try {
            BitMatrix matriz = new QRCodeWriter().encode(
                    contenido, BarcodeFormat.QR_CODE, TAMANIO, TAMANIO,
                    Map.of(EncodeHintType.MARGIN, 2));

            BufferedImage imagen = new BufferedImage(TAMANIO, TAMANIO, BufferedImage.TYPE_INT_RGB);
            for (int x = 0; x < TAMANIO; x++) {
                for (int y = 0; y < TAMANIO; y++) {
                    imagen.setRGB(x, y, matriz.get(x, y) ? 0x000000 : 0xFFFFFF);
                }
            }

            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            ImageIO.write(imagen, "png", salida);
            return salida.toByteArray();

        } catch (WriterException | IOException e) {
            throw new IllegalStateException("No se pudo generar el codigo QR", e);
        }
    }
}
