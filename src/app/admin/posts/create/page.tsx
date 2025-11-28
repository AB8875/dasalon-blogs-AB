754|         <div>
755|           <Label>Content</Label>
756|           <div className="mt-2 border rounded-md min-h-[200px] bg-white">
757|             <RichTextEditor
758|               content={content}
759|               onChange={setContent}
760|             />
761|             {typeof window === 'undefined' ? (
762|               <div className="p-6 text-center text-muted-foreground">Loading editor...</div>
763|             ) : null}
764|           </div>
765|         </div>