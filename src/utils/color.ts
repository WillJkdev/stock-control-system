export const validateHexColor = (
  color: string,
): {
  isValid: boolean;
  message?: string;
} => {
  if (!color.startsWith('#')) {
    return { isValid: false, message: 'El color debe comenzar con #' };
  }

  if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return {
      isValid: false,
      message: 'Formato HEX inválido (ej. válidos: #FFF, #FFFFFF)',
    };
  }

  return { isValid: true };
};
