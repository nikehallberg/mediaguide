import { NavLink } from "react-router-dom";
import "./Navbar.css";
import Logo from "../../assets/logo.png";

const Navbar = () => {
  return (
    <nav>
      <div>
        <NavLink to="/">
          <img className="logo" src={Logo} alt="" />
        </NavLink>
      </div>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/books">Books</NavLink>
        </li>
        <li>
          <NavLink to="/movies">Movies</NavLink>
        </li>
        <li>
          <NavLink to="/songs">Songs</NavLink>
        </li>
        <li>
          <NavLink to="/shows">Shows</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
