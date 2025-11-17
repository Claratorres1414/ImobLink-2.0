package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.Services.MicroserviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/integracao")
public class MicroserviceController {
    private final MicroserviceService mcsService;

    // Rota para gerar legenda
    @PostMapping("/legenda")
    public ResponseEntity<String> gerarLegenda(@RequestParam("file") MultipartFile file) throws IOException {
        return mcsService.gerarLegenda(file);
    }

    // Rota para processar documento OCR
    @PostMapping("/ocr")
    public ResponseEntity<String> processarDocumento(
            @RequestParam("frente") MultipartFile frente,
            @RequestParam("verso") MultipartFile verso) throws IOException {
        return mcsService.processarDocumento(frente, verso);
    }
}
