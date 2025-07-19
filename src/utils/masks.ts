/**
 * Aplica máscara de CPF (000.000.000-00) enquanto o usuário digita
 * @param value Valor do campo (pode ser null ou string)
 * @returns String formatada com máscara de CPF
 */
const maskCPF = (value: string | null): string => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }
  
  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const cpfDigits = digitsOnly.substring(0, 11);
  
  // Aplica a máscara 000.000.000-00
  let maskedValue = cpfDigits;
  
  if (cpfDigits.length > 3) {
    maskedValue = cpfDigits.replace(/^(\d{3})(\d)/, '$1.$2');
  }
  
  if (cpfDigits.length > 6) {
    maskedValue = maskedValue.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  }
  
  if (cpfDigits.length > 9) {
    maskedValue = maskedValue.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  
  return maskedValue;
};

/**
 * Aplica máscara de CEP (00000-000) enquanto o usuário digita
 * @param value Valor do campo
 * @returns String formatada com máscara de CEP
 */
const maskCEP = (value: string | null): string => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }
  
  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const cepDigits = digitsOnly.substring(0, 8);
  
  // Aplica a máscara 00000-000
  let maskedValue = cepDigits;
  
  if (cepDigits.length > 5) {
    maskedValue = cepDigits.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
  }
  
  return maskedValue;
};

/**
 * Aplica máscara de telefone enquanto o usuário digita
 * Suporta formatos (00) 00000-0000 (celular) e (00) 0000-0000 (fixo)
 * @param value Valor do campo (pode ser null ou string)
 * @returns String formatada com máscara de telefone
 */
const maskPhone = (value: string | null): string => {
  if (value === null || value === '') {
    return '';
  }

  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limita a no máximo 11 dígitos
  const phoneDigits = digitsOnly.substring(0, 11);
  
  // Aplica máscara progressivamente conforme o usuário digita
  let maskedValue = phoneDigits;
  
  if (phoneDigits.length > 2) {
    maskedValue = phoneDigits.replace(/^(\d{2})(\d)/, '($1) $2');
  }
  
  // Telefone celular (11 dígitos)
  if (phoneDigits.length > 7 && phoneDigits.length === 11) {
    maskedValue = maskedValue.replace(/^\((\d{2})\) (\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
  }
  // Telefone fixo (10 dígitos)
  else if (phoneDigits.length > 6) {
    maskedValue = maskedValue.replace(/^\((\d{2})\) (\d{4})(\d{0,4})$/, '($1) $2-$3');
  }
  
  return maskedValue;
};

const maskOnlyNum = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(/\D/g, '');
  return maskedValue;
};

const maskCNS = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(
    /^(\d{3})(\d{4})(\d{4})(\d{4})$/,
    '$1 $2 $3 $4'
  );
  return maskedValue;
};

/**
 * Formata uma data no formato ISO (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA)
 * @param value Data no formato ISO ou objeto Date
 * @returns Data formatada em DD/MM/AAAA
 */
const formatDateToBR = (value: string | Date | null): string => {
  if (!value) return '';
  
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Converte uma data do formato brasileiro (DD/MM/AAAA) para o formato ISO (AAAA-MM-DD)
 * @param value Data no formato brasileiro DD/MM/AAAA
 * @returns Data no formato ISO AAAA-MM-DD
 */
const parseDateFromBR = (value: string | null): string => {
  if (!value) return '';
  
  try {
    const [day, month, year] = value.split('/').map(Number);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erro ao converter data:', error);
    return '';
  }
};

/**
 * Aplica uma máscara de data no formato brasileiro (DD/MM/AAAA) enquanto o usuário digita
 * @param value Valor digitado pelo usuário
 * @returns Valor formatado com a máscara DD/MM/AAAA
 */
const maskDate = (value: string | null): string => {
  if (!value) return '';
  
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara DD/MM/AAAA
  let result = '';
  
  if (numbers.length > 0) {
    result += numbers.substring(0, Math.min(2, numbers.length));
  }
  
  if (numbers.length > 2) {
    result += '/' + numbers.substring(2, Math.min(4, numbers.length));
  }
  
  if (numbers.length > 4) {
    result += '/' + numbers.substring(4, Math.min(8, numbers.length));
  }
  
  return result;
};

const maskNRP = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(/^(\d{8})(\d{1})$/, '$1-$2');
  return maskedValue;
};

// Função antiga removida e substituida pela implementação mais robusta acima

const checkAlpha = (char: string) => {
  if (/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]/.test(char)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Valida se o email está em um formato válido
 * @param email Email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  // Expressão regular mais robusta para validar emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Valida se um CPF é válido
 * @param cpf CPF a ser validado (pode ou não ter máscara)
 * @returns true se o CPF for válido, false caso contrário
 */
const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rest = sum % 11;
  let dv1 = rest < 2 ? 0 : 11 - rest;
  
  if (dv1 !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rest = sum % 11;
  let dv2 = rest < 2 ? 0 : 11 - rest;
  
  if (dv2 !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

/**
 * Aplica máscara de RG (00.000.000-0) enquanto o usuário digita
 * @param value Valor do campo (pode ser null ou string)
 * @returns String formatada com máscara de RG
 */
const maskRG = (value: string | null): string => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }
  
  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limita a 9 dígitos (padrão mais comum para RG)
  const rgDigits = digitsOnly.substring(0, 9);
  
  // Aplica a máscara 00.000.000-0
  let maskedValue = rgDigits;
  
  if (rgDigits.length > 2) {
    maskedValue = rgDigits.replace(/^(\d{2})(\d)/, '$1.$2');
  }
  
  if (rgDigits.length > 5) {
    maskedValue = maskedValue.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  }
  
  if (rgDigits.length > 8) {
    maskedValue = maskedValue.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  
  return maskedValue;
};

/**
 * Valida se um RG está em formato válido
 * @param rg RG a ser validado
 * @returns true se o RG for válido, false caso contrário
 */
const validateRG = (rg: string): boolean => {
  // Regex para validar o formato do RG com ou sem máscara
  // Formato esperado: 00.000.000-0 ou 000000000
  // Esta validação é básica e verifica apenas o formato, não a validade numérica
  const rgRegex = /^(\d{2}\.\d{3}\.\d{3}-\d{1}|\d{8,9})$/;
  
  if (!rg) return false;
  
  // Remove caracteres não numéricos para verificar o tamanho
  const cleanRG = rg.replace(/\D/g, '');
  
  // RG deve ter entre 8 e 9 dígitos (dependendo do estado)
  if (cleanRG.length < 8 || cleanRG.length > 9) {
    return false;
  }
  
  // Verifica se o formato com máscara está correto
  if (rg.includes('.') || rg.includes('-')) {
    return rgRegex.test(rg);
  }
  
  // Se não tiver pontuação, deve ter entre 8 e 9 dígitos numéricos
  return /^\d{8,9}$/.test(cleanRG);
};

export { 
  maskCPF,
  maskCEP,
  maskPhone, 
  maskOnlyNum,
  maskCNS,
  formatDateToBR,
  parseDateFromBR,
  maskDate,
  maskNRP,
  checkAlpha,
  validateEmail,
  validateCPF,
  maskRG,
  validateRG
};
