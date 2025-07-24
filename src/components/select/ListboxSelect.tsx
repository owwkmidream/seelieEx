import React, {Fragment} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import {CheckIcon, SelectorIcon} from '@heroicons/react/solid'

interface IProps<T> {
    selected: T,
    setSelected: (selected: T) => void,
    optionList: T[],
    show: (selected: T) => string,
}

function ListboxSelect<T>(props: IProps<T>) {

    const {selected, setSelected, optionList, show} = props;

    return (
        <Listbox value={selected} onChange={setSelected}>
            <div className="seelie-relative seelie-mt-1">
                <Listbox.Button
                    className="seelie-relative seelie-w-full seelie-py-2 seelie-pl-3 seelie-pr-10 seelie-text-left seelie-bg-white seelie-rounded-lg seelie-shadow-md seelie-cursor-default focus:seelie-outline-none focus-visible:seelie-ring-2 focus-visible:seelie-ring-opacity-75 focus-visible:seelie-ring-white focus-visible:seelie-ring-offset-orange-300 focus-visible:seelie-ring-offset-2 focus-visible:seelie-border-indigo-500 sm:seelie-text-sm">
                    <span className="seelie-block seelie-truncate seelie-text-gray-900">{show(selected)}</span>
                    <span className="seelie-absolute seelie-inset-y-0 seelie-right-0 seelie-flex seelie-items-center seelie-pr-2 seelie-pointer-events-none">
              <SelectorIcon
                  className="seelie-w-5 seelie-h-5 seelie-text-gray-400"
                  aria-hidden="true"
              />
            </span>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="seelie-transition seelie-ease-in seelie-duration-100"
                    leaveFrom="seelie-opacity-100"
                    leaveTo="seelie-opacity-0"
                >
                    <Listbox.Options
                        className="seelie-absolute seelie-w-full seelie-py-1 seelie-mt-1 seelie-overflow-auto seelie-text-base seelie-bg-white seelie-rounded-md seelie-shadow-lg seelie-max-h-60 seelie-ring-1 seelie-ring-black seelie-ring-opacity-5 focus:seelie-outline-none sm:seelie-text-sm">
                        {optionList.map((person, personIdx) => (
                            <Listbox.Option
                                key={personIdx}
                                className={({active}) =>
                                    `seelie-cursor-default seelie-select-none seelie-relative seelie-py-2 seelie-pl-10 seelie-pr-4 ${
                                        active ? 'seelie-text-amber-900 seelie-bg-amber-100' : 'seelie-text-gray-900'
                                    }`
                                }
                                value={person}
                            >
                                {({selected}) => (
                                    <>
                      <span
                          className={`seelie-block seelie-truncate ${
                              selected ? 'seelie-font-medium' : 'seelie-font-normal'
                          }`}
                      >
                        {show(person)}
                      </span>
                                        {selected ? (
                                            <span
                                                className="seelie-absolute seelie-inset-y-0 seelie-left-0 seelie-flex seelie-items-center seelie-pl-3 seelie-text-amber-600">
                          <CheckIcon className="seelie-w-5 seelie-h-5" aria-hidden="true"/>
                        </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    )
}

export default ListboxSelect;
