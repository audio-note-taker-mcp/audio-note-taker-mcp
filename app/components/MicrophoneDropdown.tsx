"use client";

import { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";

interface MicrophoneOption {
  deviceId: string;
  label: string;
}

export default function MicrophoneDropdown({
  onSelect,
  className = "",
}: {
  onSelect: (deviceId: string) => void;
  className?: string;
}) {
  const [microphones, setMicrophones] = useState<MicrophoneOption[]>([]);
  const [selected, setSelected] = useState<MicrophoneOption | undefined>(
    undefined
  );

  useEffect(() => {
    async function getMicrophones() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${d.deviceId.substring(0, 5)}`,
          }));
        setMicrophones(mics);
        if (mics.length > 0) {
          setSelected(mics[0]);
          onSelect(mics[0].deviceId);
        }
      } catch (e) {
        setMicrophones([]);
      }
    }
    getMicrophones();
  }, [onSelect]);

  const handleChange = (option: MicrophoneOption) => {
    setSelected(option);
    onSelect(option.deviceId);
  };

  return (
    <div className={className}>
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 bg-white/10 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-opacity-75 text-white border border-teal-400/50">
            <span className="block truncate">
              {selected ? selected.label : "Select Microphone"}
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 bg-white/10 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10 text-white">
            {microphones.length === 0 && (
              <div className="text-gray-500 px-4 py-2">
                No microphones found
              </div>
            )}
            {microphones.map((mic) => (
              <Listbox.Option
                key={mic.deviceId}
                value={mic}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-teal-800 text-white" : "text-white"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {mic.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600">
                        ✓
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
