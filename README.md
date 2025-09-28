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
    Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token.

PostController:
  POST - /api/posts/create
    permite que o usuário realize publicações com uma imagem, descrição, preço da casa, rua e bairro, seu body é multipart tendo os seguintes campos:
      description | algo
      price | 123.4
      street | uma rua
      avenue | um bairro
      image | IMG_ajfkdkj.jpeg
    Essa requisição exige header com a estrutura: Authorization | Bearer token;
  GET - /api/posts/my-posts
    permite que o usuário veja todas as suas publicações em uma lista de ordem cronológica, da mais recente para a mais antiga. Essa rquisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;
  GET - /api/posts/{id}/image
    esse endpoint faz a busca da imagem no banco de dados com base no id e serve ela pra visualização, esse endpoint não é diretamente utilizado, ele é requisitado a partir do PostResponse onde ele faz a busca da imagem por sua url.
  PATCH - /api/posts/edit/{id}
    esse endpoint permite realizar a edição do post com base em seu id, seu body é flexível, já que depende das informações passadsas para atualização, mas de modo completo ele tem a seguinte estrutura:
    {
      "description" : "AAAAAA"
      "price" : 0.0
      "street" : "rua 2"
      "avenue" : "Bairro bacana esse ein"
    }
    Essa requisição exige header com a estrutura: Authorization | Bearer token;
  DELETE - /api/posts/delete/{id}
    esse endpoint permite o usuário deletar publicações com base no id. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

UserController
  GET - /api/user/account
    esse endpoint informa todas as informações da conta do usuário. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.
  PATCH - /api/user/setInfo
    esse endpoint permite as auterações de informação do usuário, atualmente seu body é:
    {
      "bio" : "algo legal aí"
      "name" : "fulano de tal"
      "phoneNumber" : "45523"
    }
    salientando que esse endpoint permite campos vazios caso o usuário só vá atualizar uma das três informações e lembrando que a requisição exige autenticação no header com a estrutura: Authorization | Bearer token.
