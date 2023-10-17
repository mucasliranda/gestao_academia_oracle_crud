# SISTEMA DE GESTAO DE ACADEMIA
 
## Requisitos
- Node.js
- npm

## Configuração
1. Clone este repositório:

```bash
git clone https://github.com/seu-usuario/sua-aplicacao.git
```

2. Opção 1: Usando Docker Compose (recomendado)

    1. Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.
     2. Navegue até o diretório raiz do seu projeto, onde o arquivo `docker-compose.yml` está localizado.
     3. Execute o seguinte comando para criar e iniciar o contêiner do banco de dados e popular o banco:

       ```bash
       docker-compose up
       ```

 3. Opção 2: Usando Banco de Dados Local (recomendado)
   
    1. Copie os scripts do `/scripts`

3. Inicializar a aplicação
  
    1. Mova até o arquivo `app`
    2. Execute os seguintes comandos:
      ```bash
      npm install
      npm run dev
      ```