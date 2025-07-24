import React from "react";
import {Switch} from "@headlessui/react";

interface IProps {
    className?: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    labelLeft: string,
    labelRight: string,
}

function ToggleSwitch(props: IProps) {

    const {className, checked, onChange, labelLeft, labelRight} = props;

    return <div className={`${className} seelie-flex seelie-flex-row`}>
        <div className='seelie-w-1/4'>{labelLeft}</div>
        <div className='seelie-w-1/2'>
            <Switch
                checked={checked}
                onChange={onChange}
                className={`${
                    checked ? 'seelie-bg-blue-600' : 'seelie-bg-gray-200'
                } seelie-relative seelie-inline-flex seelie-items-center seelie-h-6 seelie-rounded-full seelie-w-11`}
            >
                <span
                    className={`${
                        checked ? 'seelie-translate-x-6' : 'seelie-translate-x-1'
                    } seelie-inline-block seelie-w-4 seelie-h-4 seelie-transform seelie-bg-white seelie-rounded-full`}
                />
            </Switch>
        </div>
        <div className='seelie-w-1/4'>{labelRight}</div>
    </div>

}

export default ToggleSwitch;
