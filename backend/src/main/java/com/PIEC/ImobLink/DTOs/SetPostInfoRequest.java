package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SetPostInfoRequest {
    @Schema(example = "Uma casa bonita")
    private String description;
    @Schema(example = "1000000")
    private double price;
    @Schema(example = "Rua 15")
    private String street;
    @Schema(example = "Bairro Esperança")
    private String avenue;
    @Schema(example = "15")
    private String number;
    @Schema(example = "venda")
    private String type;
    @Schema(example = "[\"Mobiliada\", \"Moderna\", \"Garagem\"]")
    private List<String> tags;
}
