import React, { useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import { host } from "../utils/APIRoutes";
import { io } from "socket.io-client";

function Logout({ currentUser }) {
	const navigate = useNavigate();

	const socket = useRef();

	const handleClick = async () => {
		localStorage.clear();
		socket.current = io(host);
		socket.current.emit("disconnected", currentUser._id);
		navigate("/login");
	};
	return (
		<>
			<Button onClick={handleClick}>
				<BiPowerOff />
			</Button>
		</>
	);
}

const Button = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0.5rem;
	border-radius: 0.5rem;
	background-color: #a7e3ff;
	border: 0.15rem solid black;
	cursor: pointer;

	svg {
		font-size: 1.3rem;
		color: #000;
	}
`;

export default Logout;
