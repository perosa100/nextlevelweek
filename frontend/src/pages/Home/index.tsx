import React from "react";
import "./styles.css";
import {FiLogIn} from 'react-icons/fi'
import {Link} from 'react-router-dom'
// import { Container } from './styles';
import logo from "../../assets/logo.svg";
const Home: React.FC = () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
          <img src={logo} alt="logo" />
        </header>

        <main>
          <h1>Seu Marketplace de coletas de resíduos.</h1>
          <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>

          <Link to="/create-point">
            <span><FiLogIn /></span>
            <strong>Cadastre um ponto de coleta</strong>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Home;
