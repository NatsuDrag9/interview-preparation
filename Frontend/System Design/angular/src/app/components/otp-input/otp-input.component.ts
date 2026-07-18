import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  AfterViewInit, 
  ViewChildren, 
  QueryList, 
  ElementRef 
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    selector: "otp-input",
    templateUrl: "./otp-input.template.html",
    styleUrls: ["./otp-input.css"],
    imports: [CommonModule]
})
export class OtpInput implements OnInit, AfterViewInit {
    @Input() length: number = 6;
    @Output() otpSubmit = new EventEmitter<string>();

    otpArray: string[] = [];

    @ViewChildren('otpField') otpFields!: QueryList<ElementRef<HTMLInputElement>>;

    ngOnInit() {
        this.otpArray = Array(this.length).fill("");
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.focusInput(0);
        }, 0);
    }

    focusInput(index: number) {
        const fields = this.otpFields.toArray();
        if (fields[index]) {
            fields[index].nativeElement.focus();
            fields[index].nativeElement.select();
        }
    }

    onInputChange(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        const val = input.value.trim();
        
        // Take the last character entered
        const char = val.slice(-1);
        
        // Validation: Allow only digits 0-9
        if (char && !/^\d$/.test(char)) {
            this.otpArray[index] = "";
            input.value = "";
            return;
        }

        this.otpArray[index] = char;
        input.value = char;

        // If char is entered, auto-focus next field
        if (char && index < this.length - 1) {
            this.focusInput(index + 1);
        }

        // Emit the OTP whenever it changes
        this.otpSubmit.emit(this.getCombinedOtp());
    }

    handleKeyDown(event: KeyboardEvent, index: number) {
        const input = event.target as HTMLInputElement;
        
        if (event.key === 'Backspace') {
            if (!this.otpArray[index]) {
                // If current input is already empty, move to previous and clear it
                if (index > 0) {
                    this.otpArray[index - 1] = "";
                    const prevInput = this.otpFields.toArray()[index - 1]?.nativeElement;
                    if (prevInput) {
                        prevInput.value = "";
                    }
                    this.focusInput(index - 1);
                }
            } else {
                // Clear the current input value
                this.otpArray[index] = "";
                input.value = "";
            }
            this.otpSubmit.emit(this.getCombinedOtp());
            event.preventDefault();
        } else if (event.key === 'Delete') {
            if (!this.otpArray[index]) {
                // If current input is already empty, move to next and clear it
                if (index < this.length - 1) {
                    this.otpArray[index + 1] = "";
                    const nextInput = this.otpFields.toArray()[index + 1]?.nativeElement;
                    if (nextInput) {
                        nextInput.value = "";
                    }
                    this.focusInput(index + 1);
                }
            } else {
                // Clear the current input value
                this.otpArray[index] = "";
                input.value = "";
            }
            this.otpSubmit.emit(this.getCombinedOtp());
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            if (index > 0) {
                this.focusInput(index - 1);
                event.preventDefault();
            }
        } else if (event.key === 'ArrowRight') {
            if (index < this.length - 1) {
                this.focusInput(index + 1);
                event.preventDefault();
            }
        }
    }

    isOtpComplete(): boolean {
        return this.otpArray.every(val => val !== "" && /^\d$/.test(val));
    }

    getCombinedOtp(): string {
        return this.otpArray.join("");
    }
}