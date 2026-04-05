import React from 'react';
import Newsletter from './Newsletter';
import FooterMenu from './FooterMenu';

const Footer = () => {
  return (
    <footer className="bg-slate-900">
      <Newsletter />
      <FooterMenu />
    </footer>
  );
};

export default Footer;
