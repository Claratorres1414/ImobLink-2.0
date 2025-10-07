package com.PIEC.ImobLink.Configurations;

import lombok.Getter;
import lombok.Setter;
import org.springframework.core.io.InputStreamResource;

import java.io.InputStream;

@Getter
@Setter
public class MultipartInputStreamFileResource extends InputStreamResource {

    private final String filename;

    public MultipartInputStreamFileResource(InputStream inputStream, String filename) {
        super(inputStream);
        this.filename = filename;
    }
}
