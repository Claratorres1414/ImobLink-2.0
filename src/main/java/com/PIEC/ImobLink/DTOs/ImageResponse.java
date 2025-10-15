package com.PIEC.ImobLink.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageResponse {
    private Long id;
    private String filename;
    private String filePath;
    private String contentType;
}
