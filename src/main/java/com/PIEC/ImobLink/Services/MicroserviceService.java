package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.Configurations.MultipartInputStreamFileResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class MicroserviceService {
    private final String url = "http://localhost:8000";
    private final RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<String> gerarLegenda(MultipartFile file) throws IOException {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    url + "/gerar-legenda",
                    requestEntity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            throw new IOException(e.getMessage());
        }
    }

    public ResponseEntity<String> processarDocumento(MultipartFile frente, MultipartFile verso) throws IOException {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("frente", new MultipartInputStreamFileResource(frente.getInputStream(), frente.getOriginalFilename()));
            body.add("verso", new MultipartInputStreamFileResource(verso.getInputStream(), verso.getOriginalFilename()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    url + "/processar-documento",
                    requestEntity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            throw new IOException(e.getMessage());
        }
    }
}