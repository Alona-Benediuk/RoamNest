import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { uk } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

const SearchCalendar = ({ onDateChange }) => {
    const [range, setRange] = useState([null, null]);
    const [start, end] = range;

    return (
        <div>
            <DatePicker
                selectsRange
                startDate={start}
                endDate={end}
                onChange={(update) => {
                    setRange(update);
                    onDateChange(update);
                }}
                minDate={new Date()}
                placeholderText="Оберіть дати заїзду та виїзду"
                locale={uk}
                inline
            />
        </div>
    );
};

export default SearchCalendar;