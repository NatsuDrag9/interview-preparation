import { useEffect, useRef, useState } from "react";
import "./OtpInput.css";

const OTP_LENGTH = 6;

function OtpInput() {
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {inputRefs.current[0]?.focus();}, [])

    const handleOtpChange = (e, index) => {
        const value = e.target.value.trim();

         // Update the OTP state
            setOtp((prev) => {
                const newOtp = [...prev];
                newOtp[index] = value.slice(-1); // Take only the last input
                return newOtp;
            });

        // Update the focus to the next input field
        if(index < OTP_LENGTH - 1) {
                 inputRefs.current[index+1].focus();
            }
    }

    const handlePaste = (value, index) => {
        setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index] = value;
            return newOtp;
        });

        if(index < OTP_LENGTH - 1) {
            inputRefs.current[index+1].focus();
        }
    }

    const handleOnKeyDown = (e, index) => {
        // Handle key presses - Backspace, Arrow left, Arrow Right, Delete, Paste, Prevent alphabet and special character input and only allow numbers

        console.log("e.key = ", e.key, index);

        // Prevent alphabet input
        if(e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
            console.log("e.key = ", e.key, index);
            e.preventDefault();
            return;
        }
        

        // Handle specific keys
        switch(e.key) {
            case "Backspace":
                // Prevent default behaviour
                e.preventDefault();
                
                if(otp[index]) {
                    setOtp((prev) => {
                        const newOtp = [...prev];
                        newOtp[index] = "";
                        return newOtp;
                    });
                }
                 // Only move to the previous if the current field is empty
                    if(index > 0) {
                    inputRefs.current[index-1]?.focus();
                    }
                
                break;
            case "Delete":
                // Assuming that pressing Del key only deletes and doesn't shift the cursor
                if(otp[index]) {
                    setOtp((prev) => {
                        const newOtp = [...prev];
                        newOtp[index] = "";
                        return newOtp;
                    });
                }
                break;
            case "ArrowRight":
                // Move the focus to the next field
                if(index < OTP_LENGTH - 1) {
                    inputRefs.current[index+1].focus();
                }
                break;
            case "ArrowLeft":
                // Move the focus to the next field
                if(index > 0) {
                    inputRefs.current[index-1].focus();
                }
                break;
            default:
                break;
        }
        
    }

    return (
        <div className="otp-input">
            {Array.from({length: OTP_LENGTH}).map((_, index) => {
                return (
                    <input type="text" ref={(el) => inputRefs.current[index] = el}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOnKeyDown(e, index)}
                    key={index}
                    className="otp-input__input-field"
                    placeholder=""
                    data-index={index}
                     />
                )
            })}
        </div>
    )
}

export default OtpInput;