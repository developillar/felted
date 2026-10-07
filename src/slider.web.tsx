import React from "react";
import { View } from "react-native";
import { C } from "./theme";

export type SliderProps = {
  minimum: number;
  maximum: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
};
export function AmountSlider({
  minimum,
  maximum,
  value,
  onChange,
  label,
}: SliderProps) {
  const fraction =
    maximum === minimum ? 1 : (value - minimum) / (maximum - minimum);
  return (
    <View style={{ height: 44, justifyContent: "center" }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 5,
          backgroundColor: "#49345D",
          borderRadius: 4,
        }}
      >
        <View
          style={{
            height: 5,
            width: `${Math.max(0, Math.min(1, fraction)) * 100}%`,
            backgroundColor: C.accent,
            borderRadius: 4,
          }}
        />
      </View>
      <style>{`.felted-range{appearance:none;-webkit-appearance:none;width:100%;height:44px;background:transparent;outline:none;margin:0;cursor:pointer;touch-action:none}
      .felted-range::-webkit-slider-runnable-track{height:5px;background:transparent}
      .felted-range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;margin-top:-10.5px;border-radius:50%;background:#F9F1FF;border:6px solid #D7BEFF;box-shadow:0 0 0 5px #D7BEFF15,0 4px 12px #0008}
      .felted-range::-moz-range-track{height:5px;background:transparent}.felted-range::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#F9F1FF;border:6px solid #D7BEFF}
      .felted-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 4px #0B0911,0 0 0 6px #E6C491}
    `}</style>
      <input
        className="felted-range"
        type="range"
        aria-label={label}
        aria-valuetext={`$${(value / 100).toFixed(2)}`}
        min={minimum}
        max={maximum}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </View>
  );
}
