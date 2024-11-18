import {render, screen} from "@testing-library/react"
import Signup from "./Signup"
import React,  {useEffect, useState} from "react"

jest.mock('axios')

describe('Signup Component', () => {
    it('renders without crashing', () => {
      const { getByText, getByPlaceholderText } = render(<Signup />);
      const signupLabel = getByText('Signup');
      const nameInput = getByPlaceholderText('Name');
      const emailInput = getByPlaceholderText('Email');
      const teamInput = getByPlaceholderText('Team number');
      const passwordInput = getByPlaceholderText('Password');
      expect(signupLabel).toBeInTheDocument();
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(teamInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
})

/*describe("Test signup component", ()=>{
    it("render the signup component with 4 input placeholder",() =>{
        render(<Signup />);
        const inputList = screen.findAllByRole("input");
        expect(inputList).toHaveLength(4);
    })

})*/