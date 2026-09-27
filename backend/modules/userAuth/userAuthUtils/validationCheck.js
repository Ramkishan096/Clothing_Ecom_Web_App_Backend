const isValidMobile = (value) => {
  return /^[0-9]{10}$/.test(value); // only 10 digits
};

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // basic email format
};


export { isValidMobile, isValidEmail};