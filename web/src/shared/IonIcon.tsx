import { createElement } from 'react'

type IonIconProps = {
  iconName: string
}

export function IonIcon({ iconName }: IonIconProps) {
  return createElement('ion-icon', { name: iconName, 'aria-hidden': 'true' })
}
