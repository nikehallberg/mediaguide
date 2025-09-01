import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Home</h1>
        <p className="home-welcome">Welcome to MediaGuide</p>
        <p className="home-info">Explore reviews and ratings for books, movies, songs, and shows. 
          Use the navigation above to choose a category and start discovering new favorites!</p>
      </div>
      {/* <div className="home-bottom"></div> */}
    </div>
  );
};

export default Home;
 