import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateToken from './Components/CreateToken';
import List from './Components/List';
import MintBurn from "./Components/MintBurn";
import Delegate from "./Components/Delegate";
import Freeze from "./Components/Freeze";
import Send from "./Components/Send";

function App() {
    return (
        <Router>
            <div style={{display: 'flex'}}>
                <nav style={{marginRight: '20px'}}>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li><Link to="/">CreateToken</Link></li>
                        <li><Link to="/List">List</Link></li>
                        <li><Link to="/MintBurn">MintBurn</Link></li>
                        <li><Link to="/Delegate">Delegate</Link></li>
                        <li><Link to="/Freeze">Freeze</Link></li>
                        {/*<li><Link to="/Send">Send</Link></li>*/}
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<CreateToken />} />
                    <Route path="/List" element={<List />} />
                    <Route path="/MintBurn" element={<MintBurn />} />
                    <Route path="/Delegate" element={<Delegate />} />
                    <Route path="/Freeze" element={<Freeze />} />
                    {/*<Route path="/Send" element={<Send />} />*/}
                </Routes>
            </div>
        </Router>
    );
}


export default App;
