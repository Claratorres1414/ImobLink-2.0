package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.Services.MicroserviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/integracao")

@Tag(name = "Microsserviços", description = "Integração do backend com microsserviços de legenda e leitura de documento")
public class MicroserviceController {
    private final MicroserviceService mcsService;

    // Rota para gerar legenda
    @Operation(
            summary = "Gerar legenda",
            description = "Gera legenda automática com base na imagem fornecida para o post"
    )
    @PostMapping("/legenda")
    public ResponseEntity<String> gerarLegenda(@RequestParam("file") MultipartFile file) throws IOException {
        return mcsService.gerarLegenda(file);
    }

    // Rota para processar documento OCR
    @Operation(
            summary = "Extair informações do RG",
            description = "Realiza a leitura do documento e preenche os campos de nome e CPF no cadastro"
    )
    @PostMapping("/ocr")
    public ResponseEntity<String> processarDocumento(
            @RequestParam("frente") MultipartFile frente,
            @RequestParam("verso") MultipartFile verso) throws IOException {
        return mcsService.processarDocumento(frente, verso);
    }
}
