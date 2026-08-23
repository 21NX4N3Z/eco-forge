import sdg9 from '../assets/sdg/TGG_Icon_Color_09.png'
import sdg12 from '../assets/sdg/TGG_Icon_Color_12.png'
import sdg13 from '../assets/sdg/TGG_Icon_Color_13.png'

/** Inline SDG logos for PDF/print contexts. */
export default function SdgInline() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <img src={sdg9} alt="SDG 9" style={{ height: 34, width: 'auto' }} />
      <img src={sdg12} alt="SDG 12" style={{ height: 34, width: 'auto' }} />
      <img src={sdg13} alt="SDG 13" style={{ height: 34, width: 'auto' }} />
    </div>
  )
}
