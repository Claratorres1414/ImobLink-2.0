# ImobLink-2.0


AdminController:

  POST - /api/admin/promote
    promove um usuário comum a administrador, requer o email do usuário a ser promovido no Body, ex: {
                "email" : "fulano@email.com"
              }
e exige header: Authorization | Bearer token (o usuário portador desse token deve ser no mínimo administrador para promover outros usuários).

  GET - /api/admin/info/number/favedPosts/{userId}
    permite que um usuário ADMIN ou SUPER_ADMIN visualize a quantidade de vezes total que o usuário favoritou posts da plataforma passando seu id, essa requisição não possui body, mas 
  exige header: Authorization | Bearer token.

  GET - /api/admin/info/number/allPosts/favedTimes/{userId}
    permite que um usuário ADMIN ou SUPER_ADMIN visualize a quantidade de vezes total
que os posts de um usuário foram favoritados passando seu id, essa requisição não possui body, mas
  exige header: Authorization | Bearer token.
  
  GET - /api/admin//info/number/favedTimes/{postId}
  permite que um usuário ADMIN ou SUPER_ADMIN visualize a quantidade de vezes total
  que um post específico foi favoritado passando seu id, essa requisição não possui body, mas
  exige header: Authorization | Bearer token.


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



CommentsController:

  POST - /api/comments/coment/{userId}
    permite que o usuário realize comentários no perfil de outro usuário, passando o id do usuário no path, seu body é:
      {
        "content" : "abobrinha"
      }
    Essa requisição exige header com a estrutura: Authorization | Bearer token, para identificação do autor do comentário;

  POST - /api/comments/coment/{postId}
    permite que o usuário realize comentários em publicações de outros usuários, passando o id do post no path, seu body é:
    {
    "content" : "abobrinha"
    }
    Essa requisição exige header com a estrutura: Authorization | Bearer token, para identificação do autor do comentário;
      
  GET - /api/comments/getComments/{userId}
    esse endpoint tem como finalidade servir uma lista de comentários feitos àquele perfil com id endereçado no path, retornando-os em ordem cronológica. Essa requisição exige header com a estrutura: Authorization | Bearer token.

  GET - /api/comments/getComments/{userId}
    esse endpoint tem como finalidade servir uma lista de comentários feitos àquele post com id endereçado no path, retornando-os em ordem cronológica. Essa requisição exige header com a estrutura: Authorization | Bearer token.

  DELETE - /api/comments/deleteComment/{id} 
    esse endpoint tem como finalidade permitir que o usuário delete seu comentário apenas passando o id do mesmo no path. Essa requisição exige header com a estrutura: Authorization | Bearer token.



FeedController:

  GET - /api/feed
    esse request não exige body nem autenticação no header, é um enpoint totalmente público que retorna todas as publicações que estão em nosso banco.



FollowController:

  POST - /api/follow/{followingId}
    permite que um usuário siga o outro passando  o id do usuário que deseja seguir no {followingId}.
    Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  GET - /api/follow/getFollowers
    permite que o usuário visualize quem o segue. Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  GET - /api/follow/getFollowings
    permite qeu o usuário visualize quem ele está seguindo. Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  GET - /api/follow/getFollowers/{userId}
    permite a visualização dos seguidores de um usuário passando seu id no path. Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  GET - /api/follow/getFollowings/{userId}
    permite a visualização de quem um usuário segue passando seu id no path. Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;
    
  DELETE - /api/follow/unfollow/{followingId}
    permite que um usuário deixe de seguir o outro passando o id do usuário que deseja deixar de seguir no {followingId}.
    Essa requisição não exige body, mas exige header com a estrutura: Authorization | Bearer token.



ImageController:

  POST - /api/images (Só serve para fins de teste)
    permite que imagens sejam salvas no repositório, passando a imagem, seu body é multipart tendo a seguinte estrutura:
      image | IMG_aogjwot.jpeg
    Essa requisição exige header com a estrutura: Authorization | Bearer token;

  GET - /api/images/{postId}/post/thumb
    esse endpoint tem como finalidade servir a primeira imagem do respectivo post ao passar o id do post no path. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  GET - /api/images/{postId}/post/all
    esse endpoint tem como finalidade servir todos endereços e informações relevantes das imagens do respectivo post ao passar o id do post no path. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  GET - /api/images/get/{imageId}
    esse endpoint tem como finalidade servir a imagem que contém aquele respectivo id passado no path. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.



MicroserviceController:

  POST - /integracao/legenda
    permite que o usuário gere legendas automáticamente para sua publicação por meio da integração com nosso microserviço, essa requisição exige body multipart no formato:
      file | arquivo.jpeg
    Essa requisição não exige header;

  POST - /integracao/ocr
    permite que o usuário realize autopreenchimento de informações no seu cadastro ao enviar a frente e o verso do seu rg, essa requisição exige body multipart no formato:
      frente | frente.arquivo
      verso | verso.arquivo
    Essa requisição não exige header.



PostController:

  POST - /api/posts/create
    permite que o usuário realize publicações com uma imagem, descrição, preço da casa, rua,bairro e número, seu body é multipart tendo os seguintes campos:
      description | algo
      price | 123.4
      street | uma rua
      avenue | um bairro
      number | número da casa
      type | aluguel
      image | IMG_ajfkdkj.jpeg
    Essa requisição exige header com a estrutura: Authorization | Bearer token;

  POST - /api/posts/fav/{id} 
    permite que o usuário favorite uma publicação com base no id passado no path. Essa rquisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  POST - /api/posts/like/{id}
    permite que o usuário curta uma publicação com base no id passado no path. Essa rquisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  GET - /api/posts/my-favs
    permite que o usuário veja todas as publicações favoritadas por si em uma lista. Essa rquisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;
    
  GET - /api/posts/my-posts
    permite que o usuário veja todas as suas publicações em uma lista de ordem cronológica, da mais recente para a mais antiga. Essa rquisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

  GET - /getOne/{id}
    permite que o usuário veja uma publicação específica com mais detalhes, carregando unicamente ela e suas informações com base no id passado no path. Essa rquisição não exige body, mas exige header com a estrutura: Authorization | Bearer token;

    
  PATCH - /api/posts/edit/{id}
    esse endpoint permite realizar a edição do post com base em seu id, seu body é flexível, já que depende das informações passadsas para atualização, mas de modo completo ele tem a seguinte estrutura:
    {
      "description" : "AAAAAA",
      "price" : 0.0,
      "street" : "rua 2",
      "avenue" : "Bairro bacana esse ein",
      "number" : 500,
      "type" : venda
    }
    Essa requisição exige header com a estrutura: Authorization | Bearer token;
    
  DELETE - /api/posts/delete/{id}
    esse endpoint permite o usuário deletar publicações com base no id. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  DELETE - /api/posts/unfav/{id}
    esse endpoint permite o usuário remover publicações dos seus favoritos com base no id. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  DELETE - /api/posts/unlike/{id}
    esse endpoint permite o usuário retirar seu like de publicações com base no id. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.



UserController

  GET - /api/user/account
    esse endpoint informa todas as informações da conta do usuário. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  GET - /api/user/getAccount/{id}
    esse endpoint passa as informações permitidas a respeito do usuário que porta o id informado no path da requisição. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  GET - /api/user/getAll
    esse endpoint passa uma lista de usuários com as informações permitidas a respeito de cada um deles. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.

  GET - /api/user/info/favedTimes
    esse endpoint passa o cálculo de quantas vezes todas as publicações do usuário foram favoritadas no total. Essa requisição não possui body, mas exige header com a estrutura: Authorization | Bearer token.
    
  PATCH - /api/user/setInfo
    esse endpoint permite as auterações de informação do usuário, atualmente seu body é:
    {
      "bio" : "algo legal aí"
      "name" : "fulano de tal"
      "phoneNumber" : "45523"
    }
    salientando que esse endpoint permite campos vazios caso o usuário só vá atualizar uma das três informações e lembrando que a requisição exige autenticação no header com a estrutura: Authorization | Bearer token.
    
  PATCH - /api/user/setImageProfile
    esse endpoint permite a troca da imagem de perfil seja do holder base ou da imagem atual por uma nova imagem, o body dessa requisição deve ser do tipo MultipartFormData, passando um body na seguinte estrutura:
    image | imagem.jpeg
    essa requisição exige autenticação no header com a estrutura: Authorization | Bearer token.
    
  PATCH - /api/user/setPassword
    esse endpoint permite a auteração da senha mediante apresentação da senha atual, não é permitido: repetir a senha atual na nova senha ou tentar enviar uma nova senha vazia. O body dessa requisição é:
    {
      "password" : "senha atual",
      "newPassword" : "nova senha não vazia"
    }
    e esse endPoint exige header com a estrutura: Authorization | Bearer token.

  DELETE - /api/user/deleteProfile
    esse endpoint permite o usuário deletar a própria conta mediante apresentação de senha, o body da requisição é:
    {
      "password" : "senha"
    }
    e esse endPoint exige header com a estrutura: Authorization | Bearer token.
