import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  ScanLine,
  Package
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { type Product } from '@/hooks/useProducts';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  searchTerm,
  onSearchChange,
  onAddToCart
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar produtos, código de barras ou categoria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-pdv-button/20 focus:border-pdv-button"
            />
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-pdv-button"
            >
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-pdv-button hover:bg-pdv-button/90' : ''}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-pdv-button hover:bg-pdv-button/90' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Categorias:</span>
          
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
            className={!selectedCategory ? 'bg-pdv-button hover:bg-pdv-button/90' : 'hover:bg-pdv-accent'}
          >
            Todas
          </Button>
          
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-pdv-button hover:bg-pdv-button/90' : 'hover:bg-pdv-accent'}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            {selectedCategory && (
              <Badge variant="secondary" className="bg-pdv-accent text-pdv-button">
                {selectedCategory}
              </Badge>
            )}
          </div>
          
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="text-xs text-muted-foreground hover:text-pdv-button"
            >
              Limpar busca
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="bg-white rounded-lg border shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pdv-button mx-auto mb-2"></div>
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar os filtros de busca'
                : 'Adicione produtos ao sistema para começar'
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className={`p-4 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}