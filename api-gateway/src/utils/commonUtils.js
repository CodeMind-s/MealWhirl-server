const base64Util = {
    encode: (text) => {
      return Buffer.from(text, 'utf-8').toString('base64');
    },
  
    decode: (base64Text) => {
      return Buffer.from(base64Text, 'base64').toString('utf-8');
    }
  };
  
  module.exports = {
    base64Util
  };