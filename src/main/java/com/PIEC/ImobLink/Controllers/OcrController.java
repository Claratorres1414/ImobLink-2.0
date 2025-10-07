package com.PIEC.ImobLink.Controllers;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.PIEC.ImobLink.Configurations.MultipartInputStreamFileResource;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@RestController
@RequestMapping("/ocr")
public class OcrController {

    @PostMapping("/processar")
    public ResponseEntity<String> processarDocumento(
            @RequestParam("frente") MultipartFile frente,
            @RequestParam("verso") MultipartFile verso) {

        try {
            String url = "http://localhost:8000/processar-documento";
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("frente", new MultipartInputStreamFileResource(frente.getInputStream(), frente.getOriginalFilename()));
            body.add("verso", new MultipartInputStreamFileResource(verso.getInputStream(), verso.getOriginalFilename()));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao processar documento: " + e.getMessage());
        }
    }
}