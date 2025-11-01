package cnpmnc.assignment.dto;


import lombok.Getter;
import lombok.Setter;

//Phan trang
@Getter
@Setter
public class ResultPaginationDTO {
    private Meta meta;
    private Object result;
    @Getter
    @Setter
    public static class Meta {
        private int page;
        private int pageSize;
        private int total;
        private int pages;
    }
}
