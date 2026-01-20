package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SetInfoRequest {
    @Schema(example = "AAAAAA")
    private String bio;
    @Schema(example = "Um nome criativo")
    private String name;
    @Schema(example = "(11) 91111-0000")
    private String phoneNumber;
}
