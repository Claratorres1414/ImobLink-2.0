package com.PIEC.ImobLink.Controllers;

import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.PIEC.ImobLink.Configurations.MultipartInputStreamFileResource;

@RestController
@RequestMapping("/integracao")
public class MicroserviceController {

    private final RestTemplate restTemplate = new RestTemplate();

    // Rota para gerar legenda
    @PostMapping("/legenda")
    public ResponseEntity<String> gerarLegenda(@RequestParam("file") MultipartFile file) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "http://localhost:8000/gerar-legenda",
                    requestEntity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao gerar legenda: " + e.getMessage());
        }
    }

    // Rota para processar documento OCR
    @PostMapping("/ocr")
    public ResponseEntity<String> processarDocumento(
            @RequestParam("frente") MultipartFile frente,
            @RequestParam("verso") MultipartFile verso) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("frente", new MultipartInputStreamFileResource(frente.getInputStream(), frente.getOriginalFilename()));
            body.add("verso", new MultipartInputStreamFileResource(verso.getInputStream(), verso.getOriginalFilename()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "http://localhost:8000/processar-documento",
                    requestEntity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar documento: " + e.getMessage());
        }
    }
}
