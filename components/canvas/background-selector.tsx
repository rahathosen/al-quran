"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Define background images
const backgroundImages = [
  { id: "mountains", src: "/canvas-images/mountains.webp", alt: "Mountains" },
  { id: "nature1", src: "/canvas-images/nature1.jpeg", alt: "Snowy Mountains" },
  { id: "water", src: "/canvas-images/water.webp", alt: "Dark Ocean" },
  { id: "ocean", src: "/canvas-images/ocean.jpeg", alt: "Blue Ocean" },
  { id: "mountain-peak", src: "/canvas-images/mountain-peak.jpeg", alt: "Mountain Peak" },
  { id: "forest", src: "/canvas-images/forest.jpeg", alt: "Misty Forest" },
  { id: "lavender", src: "/canvas-images/lavender.jpeg", alt: "Lavender Field" },
  { id: "sunset", src: "/canvas-images/sunset.jpeg", alt: "Sunset" },
  { id: "bridge", src: "/canvas-images/bridge.jpeg", alt: "Forest Bridge" },
]

interface BackgroundSelectorProps {
  onSelect: (background: string) => void
}

export default function BackgroundSelector({ onSelect }: BackgroundSelectorProps) {
  const [selectedBackground, setSelectedBackground] = useState("")

  const handleBackgroundChange = (background: string) => {
    setSelectedBackground(background)
    onSelect(background)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Background</h3>
      <RadioGroup value={selectedBackground} onValueChange={handleBackgroundChange} className="grid grid-cols-3 gap-2">
        {backgroundImages.map((image) => (
          <div key={image.id} className="relative">
            <RadioGroupItem value={image.src} id={image.id} className="sr-only" />
            <Label htmlFor={image.id} className="cursor-pointer">
              <Card
                className={`overflow-hidden h-20 w-full border-2 ${
                  selectedBackground === image.src ? "border-primary" : "border-transparent"
                }`}
              >
                <div className="relative h-full w-full">
                  <img src={image.src || "/placeholder.svg"} alt={image.alt} className="h-full w-full object-cover" />
                </div>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

