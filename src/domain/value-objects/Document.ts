export type DocumentType = 'CPF' | 'CNPJ';

export class Document {
  private readonly _value: string;
  
  constructor(value: string) {
    const sanitized = value.replace(/\D/g, '');
    if (!this.validate(sanitized)) {
      throw new Error('Invalid CPF/CNPJ');
    }
    this._value = sanitized;
  }

  get value(): string {
    return this._value;
  }

  get type(): DocumentType {
    return this._value.length === 11 ? 'CPF' : 'CNPJ';
  }

  public format(): string {
    if (this.type === 'CPF') {
      return this._value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return this._value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  }

  private validate(c: string): boolean {
    if (c.length === 11) return this.validateCPF(c);
    if (c.length === 14) return this.validateCNPJ(c);
    return false;
  }

  private validateCPF(cpf: string): boolean {
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  private validateCNPJ(cnpj: string): boolean {
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    const calc = (x: number) => {
      const slice = cnpj.slice(0, x);
      let factor = x - 7;
      let sum = 0;
      
      for (let i = x; i >= 1; i--) {
        const n = parseInt(slice[x - i] ?? '0'); // FIX: Adicionado '?? '0''
        sum += n * factor--;
        if (factor < 2) factor = 9;
      }
      
      const result = 11 - (sum % 11);
      return result > 9 ? 0 : result;
    };
    
    const digits = cnpj.slice(12);
    const digit0 = calc(12);
    const digit1 = calc(13);
    
    // FIX: Garantir que digits[0] e digits[1] existem
    return digit0 === parseInt(digits[0] ?? '0') && 
           digit1 === parseInt(digits[1] ?? '0');
  }
}