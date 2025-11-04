import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil } from 'lucide-react';
import Image from 'next/image';

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const { data: baptismItems } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('category', 'baptism')
    .order('display_order', { ascending: true });

  const { data: decorationItems } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('category', 'decoration')
    .order('display_order', { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground">Manage baptism packages and decorations</p>
        </div>
        <Link href="/admin/gallery/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Gallery Item
          </Button>
        </Link>
      </div>

      {/* Baptism Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Baptism Packages</h2>
        {baptismItems && baptismItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {baptismItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                    {item.images && item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title_el}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title_el}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description_el}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/admin/gallery/${item.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <span className={`px-3 py-1.5 rounded text-xs ${
                      item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No baptism items yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Decorations Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Decorations</h2>
        {decorationItems && decorationItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decorationItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                    {item.images && item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title_el}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title_el}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description_el}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/admin/gallery/${item.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <span className={`px-3 py-1.5 rounded text-xs ${
                      item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No decoration items yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

