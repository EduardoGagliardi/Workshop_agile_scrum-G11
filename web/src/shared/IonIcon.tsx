import { iconSources } from '../registerIonIcons'

type IonIconProps = {
  iconName: string
}

function dataUrlToSvgMarkup(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',')
  if (commaIndex === -1) return ''

  const payload = dataUrl.slice(commaIndex + 1)
  if (dataUrl.includes(';utf8,')) {
    return decodeURIComponent(payload)
  }

  return atob(payload)
}

export function IonIcon({ iconName }: IonIconProps) {
  const source = iconSources[iconName]

  if (!source) {
    if (import.meta.env.DEV) {
      console.warn(`[IonIcon] Unknown icon "${iconName}". Add it to registerIonIcons.ts`)
    }
    return null
  }

  const svgMarkup = dataUrlToSvgMarkup(source)
  if (!svgMarkup) return null

  return (
    <span
      className="ion-icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
}
