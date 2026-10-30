import styled from 'styled-components'
 
 export const Scroll = styled.div`
width:100%;
 overflow-y:auto;
 text-align:${props => props.textAlign || ""};
 height: ${props => props.height || ""};
 min-height: ${props => props.minHeight || ""};
 max-height: ${props => props.maxHeight || ""};
 position:relative;
 margin: ${props => props.margin || "0px"};
 &::-webkit-scrollbar {
  width: 0rem;
  background-color: #0E425A;
  border-radius: 1rem;


}
 `;