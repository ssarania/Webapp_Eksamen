import { useState } from 'react'

interface ProfilePicture {
  id: string
  name: string
  emoji: string
  description: string
}

const DEFAULT_PROFILE_PICTURES: ProfilePicture[] = [
  {
    id: 'scholar',
    name: 'Scholar',
    emoji: '🎓',
    description: 'Academic excellence'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    emoji: '🚀',
    description: 'Learning at speed'
  },
  {
    id: 'brain',
    name: 'Brain',
    emoji: '🧠',
    description: 'Knowledge seeker'
  }
]

interface ProfilePictureSelectorProps {
  selectedPicture?: string | null
  onSelect?: (pictureId: string) => void
  readonly?: boolean
}

export default function ProfilePictureSelector({
  selectedPicture,
  onSelect,
  readonly = false
}: ProfilePictureSelectorProps) {
  const [localSelected, setLocalSelected] = useState(selectedPicture)

  const handleSelect = (pictureId: string) => {
    if (readonly) return
    setLocalSelected(pictureId)
    onSelect?.(pictureId)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Choose a Profile Picture
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Select one of our quiz-themed profile pictures
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {DEFAULT_PROFILE_PICTURES.map((picture) => (
          <button
            key={picture.id}
            onClick={() => handleSelect(picture.id)}
            disabled={readonly}
            className={`relative group rounded-2xl p-6 transition-all duration-300 ${
              localSelected === picture.id
                ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
            } ${readonly ? 'cursor-default' : 'cursor-pointer hover:shadow-lg'}`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50 group-hover:to-purple-50/20 dark:from-blue-900/0 dark:to-purple-900/0 dark:group-hover:from-blue-900/10 dark:group-hover:to-purple-900/10 rounded-2xl transition-all duration-300 pointer-events-none" />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-3">
              {/* Emoji Avatar */}
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                {picture.emoji}
              </div>

              {/* Name */}
              <h4 className="font-semibold text-slate-900 dark:text-white text-center">
                {picture.name}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center leading-tight">
                {picture.description}
              </p>

              {/* Selection Indicator */}
              {localSelected === picture.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export { DEFAULT_PROFILE_PICTURES }
export type { ProfilePicture }
