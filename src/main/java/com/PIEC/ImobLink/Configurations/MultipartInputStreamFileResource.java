package com.PIEC.ImobLink.Configurations;

import lombok.Getter;
import lombok.Setter;
import org.springframework.core.io.InputStreamResource;

import io.jsonwebtoken.io.IOException;

import java.io.InputStream;

@Getter
@Setter
public class MultipartInputStreamFileResource extends InputStreamResource {

    private final String filename;

    public MultipartInputStreamFileResource(InputStream inputStream, String filename) {
        super(inputStream);
        this.filename = filename;
    }
    @Override
    public long contentLength() throws IOException {
        return -1; // we do not want to generally read the whole stream into memory ...
    }
}
