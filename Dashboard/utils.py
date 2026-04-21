def extract_token_from_response_json(data: dict):
    if not isinstance(data, dict):
        return None

    # 🔥 CASO PRINCIPAL DO SEU BACKEND
    if "data" in data and isinstance(data["data"], dict):
        inner = data["data"]

        for key in ["token", "access_token", "accessToken", "jwt"]:
            if key in inner and isinstance(inner[key], str):
                return inner[key].replace("Bearer ", "")

    # fallback (caso venha direto)
    for key in ["token", "access_token", "accessToken", "jwt"]:
        if key in data and isinstance(data[key], str):
            return data[key].replace("Bearer ", "")

    # fallback JWT bruto
    for v in data.values():
        if isinstance(v, str) and v.count(".") == 2:
            return v

    return None

