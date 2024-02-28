import "./style/global.css";
import { useNavigate } from 'react-router-dom';

// This file will add the navbar to the neccessary pages. It is currently adding the navbar to 
// regions, image-upload, multi-image-upload, region-upload, moderators, my-map, timelinescroller, about.
// This nav bar allows general users to reroute to regions, upload single/multi upload, create region, and about.
// This nav bar allows moderators to reroute to regions, upload single/multi upload, create region, moderators, and about.
// General users and Moderators have the ability to log out in the top right.

const NavBarTop = ({user}) => {
    const navigate = useNavigate();
    return (
        <div className="navbar">
            <nav>
                <ul className="left-header">
                    <li><a href="/regions">TIMELINE</a></li>
                    {(user.role === "general" || user.role === "moderator") && <li><a href="/imageupload">Upload Single Image</a></li>}
                    {(user.role === "general" || user.role === "moderator") && <li><a href="/multiupload">Upload Multiple Images</a></li>}
                    {(user.role === "general" || user.role === "moderator") && <li><a href="/regionupload">Create Region</a></li>}
                    {user.role === "moderator" && <li><a href="/moderator">Moderators</a></li>}
                </ul>
                <ul className="right-header">
                    {(user.username !== "GUEST") &&
                        <li><a style={user.role === "general" ? { color: '#84c2b2', } : { color: '#8466de' }}>{user.username}</a></li>}
                    <li><a href="/about">About</a></li>
                    <li><a href="/">Log Out</a></li>
                </ul>
            </nav>
        </div>
    )
};
export default NavBarTop;