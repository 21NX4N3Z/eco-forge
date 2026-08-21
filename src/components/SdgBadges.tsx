// Real SDG logo images (UN Global Goals icons) loaded from src/assets/sdg/.
import sdg7 from '../assets/sdg/TGG_Icon_Color_07.png'
import sdg9 from '../assets/sdg/TGG_Icon_Color_09.png'
import sdg12 from '../assets/sdg/TGG_Icon_Color_12.png'
import sdg13 from '../assets/sdg/TGG_Icon_Color_13.png'
import sdg17 from '../assets/sdg/TGG_Icon_Color_17.png'

const GOALS = [
  { n: 7, name: 'Affordable & Clean Energy', img: sdg7 },
  { n: 9, name: 'Industry, Innovation & Infrastructure', img: sdg9 },
  { n: 12, name: 'Responsible Consumption & Production', img: sdg12 },
  { n: 13, name: 'Climate Action', img: sdg13 },
  { n: 17, name: 'Partnerships for the Goals', img: sdg17 },
]

export default function SdgBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {GOALS.map((g) => (
        <img key={g.n} src={g.img} alt={`SDG ${g.n}: ${g.name}`} title={`SDG ${g.n}: ${g.name}`}
          className={compact ? 'h-7 w-auto' : 'h-10 w-auto'} />
      ))}
    </div>
  )
}
