import React, { useEffect, useRef } from 'react';
import './style/about.css';
import './style/global.css';
import NavBarTop from "./navbar";

// Import CookiesProvider for managing cookies
import { CookiesProvider, useCookies } from "react-cookie";

const AboutPage = ({ user }) => {
  // Create a reference to the scroll container
  const scrollRef = useRef(null);

  // Use cookies hook for managing cookies
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  // useEffect to set up IntersectionObserver for revealing elements on scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const options = {
      root: scrollContainer,
      threshold: 0.5,
    };

    // Create IntersectionObserver to handle element visibility
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-elements');
        }
      });
    }, options);

    // Observe elements with the 'reveal-on-scroll' class
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((element) => observer.observe(element));

    // Cleanup: disconnect the observer when component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to handle user logout
  function handleLogout() {
    removeCookie("user");
  }

  return (
    <div className="about-page gradient-background" ref={scrollRef}>
      <NavBarTop user={user}/>
      <div className="about-content">
        <h2>About Us</h2>

        <h3 className="reveal-on-scroll">Introduction</h3>
        <p className="reveal-on-scroll">
          Discover the world through the lens of time with TIMELINE, a revolutionary web application born out of our 
          passion for connecting people through geolocated and time-stamped images. TIMELINE offers users a unique 
          experience by curating region- and time-specific photos upon request. It is a platform for individuals 
          seeking to share experiences and explore both familiar and unfamiliar locations. As the culmination of our 
          software engineering class, TIMELINE is not just a platform; it's an experience that transcends boundaries, 
          offering a unique perspective on how places evolve.
        </p>

        <br></br><br></br><br></br><br></br><br></br><br></br>

        <h3 className="reveal-on-scroll">Developers:</h3>
        <p className="reveal-on-scroll">
          <ul>
            <li className="devs">Grant Hergenroeder</li>
            <li className="devs">Koushik Thiyagarajan</li>
            <li className="devs">Tyler Grove</li>
            <li className="devs">Valine Uzoukwu</li>
            <li className="devs">Griffin Anderson</li>
            <li className="devs">Sambit Sahoo</li>
          </ul>
        </p>

        <br></br><br></br><br></br><br></br><br></br><br></br>

        <h3 className="reveal-on-scroll">Our Mission</h3>
        <p className="reveal-on-scroll">
          Our mission is to provide a platform for people to share their experiences and stories 
          through geolocated and timestamped images as a function of time. We want to provide a space 
          for people to share their stories and to learn about the stories of others in a new, unique way.
        </p>

        <br></br><br></br><br></br><br></br><br></br><br></br>

        <h3 className="reveal-on-scroll">What We Offer</h3>
        <p className="reveal-on-scroll">
          TIMELINE is not just an application; it's a journey through time and space. Our interactive mapping 
          features and timeline functionalities enable users to visually traverse different places, fostering 
          community building and facilitating research. Whether you're a student documenting historical events 
          or a community member sharing experiences, TIMELINE brings value by providing a platform to learn, 
          connect, and understand.
        </p>

        <br></br><br></br><br></br><br></br><br></br><br></br>

        <h3 className="reveal-on-scroll">Who You Are</h3>
        <p className="reveal-on-scroll">
        TIMELINE caters to a diverse audience, bridging the gap between the general population and professionals. From individuals seeking to build communities by sharing personal experiences to researchers documenting changes in a local environment, TIMELINE connects people with a shared interest in time and place.
        Users who upload images on our site can provide different perspectives to those who are interested. Additionally, the experiences users share facilitate connection and community building through our platform. For example, a concertgoer sharing her favorite pictures from a concert venue or a university graduate interested in sharing his study spot on campus are all potential use cases that align with such users. Furthermore, users that fall into the general population can elect to use TIMELINE to glean information on how different regions can change over time. Think of someone viewing how their hometown has changed over time.
        Similarly, TIMELINE satisfies the needs of researchers and professionals. With TIMELINE such individuals can examine locations with respect to time or perspective. For example, an environmental scientist is interested in documenting the changes made to a local pond over time, or a construction site manager is interested in viewing the progress of housing developments from different angles 
        </p>

        <br></br><br></br><br></br><br></br><br></br><br></br>

      </div>
    </div>
  );
};

export default AboutPage;
