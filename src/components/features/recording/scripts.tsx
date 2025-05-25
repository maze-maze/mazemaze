import type { Conversation } from '🎙️/lib/types/recording'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '🎙️/components/ui/accordion'

export default function Scripts({ script, conversation }: { script: string, conversation: Conversation[] }) {
  return (
    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="bg-background/20 backdrop-blur-lg border-t absolute bottom-30 left-2 right-2">
      <AccordionItem value="item-1">
        <AccordionTrigger>台本</AccordionTrigger>
        <AccordionContent className="overflow-y-auto max-h-96">
          {script}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>文字起こし</AccordionTrigger>
        <AccordionContent className="overflow-y-auto max-h-32">
          {conversation.map((item, index) => (
            <div key={index}>
              <p>{item.role}</p>
              <p className="mb-2">{item.text}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
