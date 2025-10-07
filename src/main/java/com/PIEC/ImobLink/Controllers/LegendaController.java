package com.PIEC.ImobLink.Controllers;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;

@RestController
@RequestMapping("/legenda")
public class LegendaController {

    @PostMapping("/gerar")
    public ResponseEntity<String> gerarLegenda(@RequestParam("imagem") MultipartFile imagem) {
        try {
            String url = "http://localhost:8000/gerar-legenda";

            RestTemplate restTemplate = new RestTemplate();

            // Envia a imagem para o microserviço Python
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<byte[]> entity = new HttpEntity<>(imagem.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao gerar legenda: " + e.getMessage());
        }
    }
}