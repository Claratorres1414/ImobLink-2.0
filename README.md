# ImobLink-2.0
AdminController:
  POST - /api/admin/promote
    promove um usuário comum a administrador, requer o email do usuário a ser promovido no Body, ex: {
                "email" : "fulano@email.com"
              }
e exige header: Authorization | Bearer token (o usuário portador desse token deve ser no mínimo administrador para promover outros usuários).

AuthController:
  POST - /api/auth/login
    realiza o login do usuário e retorna o token de acesso, seu body é:
    {
      "email" : "fulano@email"
      "password" : "123456"
    }
esse endpoint não exige header nem autorização;
  POST - /api/auth/register
    realiza o cadastro de novos usuários na plataforma, seu body é:
    {
      "cpf" : "1355",
      "phoneNumber" : "58269",
      "name" : "Fulano"
      "email" : "fulano@email"
      "password" : "3445"
    }
esse endpoint não exige header nem autorização.

FeedController:
  GET - /api/feed
    esse request não exige body nem autenticação no header, é um enpoint totalmente público que retorna todas as publicações que estão em nosso banco.

FollowController:
  POST - /api/follow/{followerId)/follow/{followingId}
    permite que um usuário siga o outro passando o id do usuário logado no {followerId} e o id do usuário que deseja seguir no {followingId}.
    Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;
  DELETE - /api/follow/{followerId}/unfollow/{followingId}
    permite que um usuário deixe de seguir o outro passando o id do usuário logado no {followerId} e o id do usuário que deseja deixar de seguir no {followingId}.
    Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;
