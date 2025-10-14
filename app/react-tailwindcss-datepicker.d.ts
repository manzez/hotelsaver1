declare module 'react-tailwindcss-datepicker' {
    import { FC } from 'react';
  
    export interface DateValueType {
      startDate: string | Date | null;
      endDate: string | Date | null;
    }
  
    export interface DatepickerProps {
      useRange?: boolean;
      asSingle?: boolean;
      value?: DateValueType | null;
      onChange?: (value: DateValueType | null) => void;
      displayFormat?: string;
      primaryColor?: string;
      inputClassName?: string;
      placeholder?: string;
    }
  
    const Datepicker: FC<DatepickerProps>;
    export default Datepicker;
  }
