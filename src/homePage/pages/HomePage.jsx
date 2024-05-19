import React, { useState, useEffect } from "react";
import { ProductContext } from '../../products/context';
import { ProductGrid } from '../components';
import { useContext } from "react";

export const HomePage = () => {
  const { product, fetchAllProducts } = useContext(ProductContext);
  const [inputValue, setInputValue] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    category: false,
    createdBy: false
  });

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const filtered = product.filter(item => {
      if (selectedOptions.category && item.selectedCategory) {
        return item.selectedCategory.toLowerCase().includes(inputValue.toLowerCase());
      } else if (selectedOptions.createdBy && item.displayName) {
        return item.displayName.toLowerCase().includes(inputValue.toLowerCase());
      } else {
        return item.productName.toLowerCase().includes(inputValue.toLowerCase());
      }
    });
    setFilteredProducts(filtered);
  }, [inputValue, product, selectedOptions.category, selectedOptions.createdBy]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const handleOptionChange = (option) => {
    setSelectedOptions(prevOptions => ({
      ...prevOptions,
      [option]: !prevOptions[option]
    }));
  };

  return (
    <div>
      <div className="container mt-2">
        <div className="row">
          <div className="col-md-12 mb-4">
            <form onSubmit={handleSubmit} className="d-flex justify-content-center flex-column">
              <div className="mb-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Buscar"
                  className="form-control"
                />
              </div>
              <button type="button" className="nav-link" onClick={toggleAdvancedOptions}>
                Opciones avanzadas
              </button>
              {showAdvancedOptions && (
                <div className="row mt-2">
                  <div className="col-md-6">
                  <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="category"
                        checked={selectedOptions.category}
                        onChange={() => handleOptionChange('category')}
                      />
                      <label className="form-check-label" htmlFor="category">Categoría</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="createdBy"
                        checked={selectedOptions.createdBy}
                        onChange={() => handleOptionChange('createdBy')}
                      />
                      <label className="form-check-label" htmlFor="createdBy">Creado por</label>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="row">
          <ProductGrid product={filteredProducts} tittle={"Los productos de nuestros usuarios"}/>
        </div>
      </div>
    </div>
  );
};
