#!/bin/bash

# Função para adicionar atributo required a um campo específico
adicionar_required() {
  local arquivo=$1
  local label=$2
  
  # Busca a linha que contém o label e adiciona required após fullWidth
  sed -i '' "s/label=\"$label\"\\([^}]*\\)fullWidth/label=\"$label\"\\1fullWidth\\n                      required/g" "$arquivo"
}

# Função para atualizar os campos com limite de caracteres
atualizar_campo_limite() {
  local arquivo=$1
  local nome_campo=$2
  local limite=$3
  
  # Substitui a mensagem de contagem para incluir aviso quando no limite
  sed -i '' "s/\`\${field.value?.length || 0}\/$limite caracteres\`/\`\${field.value?.length || 0}\/$limite caracteres\${field.value?.length >= $limite ? ' - Limite atingido!' : ''}\`/g" "$arquivo"
  
  # Adiciona a verificação de limite na condição de erro
  sed -i '' "s/error={!!errors.$nome_campo}/error={!!errors.$nome_campo || (field.value?.length >= $limite)}/g" "$arquivo"
}

ARQUIVO="/Users/antonino.c.gama/Documents/personal-projects/nl-admin-courses/src/pages/Professores/FormProfessor.tsx"

# Campos obrigatórios
adicionar_required "$ARQUIVO" "Nome Completo"
adicionar_required "$ARQUIVO" "CPF"
adicionar_required "$ARQUIVO" "Telefone"
adicionar_required "$ARQUIVO" "Email"
adicionar_required "$ARQUIVO" "Rua"
adicionar_required "$ARQUIVO" "Número"
adicionar_required "$ARQUIVO" "Bairro" 
adicionar_required "$ARQUIVO" "Cidade"
adicionar_required "$ARQUIVO" "Estado"
adicionar_required "$ARQUIVO" "CEP"
adicionar_required "$ARQUIVO" "Formação Acadêmica"
adicionar_required "$ARQUIVO" "Biografia"

# Atualizar campos com limite
atualizar_campo_limite "$ARQUIVO" "education" "500"
atualizar_campo_limite "$ARQUIVO" "bio" "1000"

echo "Campos atualizados com sucesso!"
